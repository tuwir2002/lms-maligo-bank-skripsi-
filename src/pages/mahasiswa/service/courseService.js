export const fetchEnrolledCourses = async (nim) => {
  try {
    console.log('Fetching enrolled courses for NIM:', nim);
    const response = await fetch('http://localhost:1337/api/undangan-mahasiswas?populate=*');
    if (!response.ok) {
      throw new Error(`Failed to fetch enrolled courses: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Undangan Mahasiswa API response:', JSON.stringify(data, null, 2));

    const mahasiswaResponse = await fetch('http://localhost:1337/api/mahasiswas');
    if (!mahasiswaResponse.ok) {
      throw new Error(`Failed to fetch student data: ${mahasiswaResponse.statusText}`);
    }
    const mahasiswaData = await mahasiswaResponse.json();
    console.log('Mahasiswa API response:', JSON.stringify(mahasiswaData, null, 2));

    const student = mahasiswaData.data.find((m) => m.nim === nim);
    if (!student) {
      throw new Error('Student not found');
    }
    console.log('Found student:', student);

    const enrolledCourses = data.data
      .filter((course) => {
        if (!course.mahasiswa || !course.mahasiswa.id) {
          console.warn('Skipping course with missing or invalid mahasiswa:', course);
          return false;
        }
        return course.mahasiswa.id === student.id;
      })
      .map((course) => {
        console.log('Processing course:', course);
        return {
          title: course.matakuliah?.nama?.trim() || 'Unknown Course',
          code: course.matakuliah?.kode?.trim() || 'N/A',
          lecturer: course.diundang_oleh ? course.diundang_oleh.namaLengkap : 'Belum Ditentukan',
          status: course.status_class === 'aktif' ? 'Aktif' : 'Selesai',
          progress: course.status_class === 'aktif' ? 50 : 100,
        };
      });

    console.log('Enrolled courses:', enrolledCourses);
    return enrolledCourses;
  } catch (error) {
    console.error('Error fetching courses:', error.message, error.stack);
    throw new Error(`Error fetching courses: ${error.message}`);
  }
};

export const fetchCourseDetail = async (courseCode, nim) => {
  try {
    console.log('Fetching course detail for code:', courseCode, 'and NIM:', nim);
    const matakuliahResponse = await fetch('http://localhost:1337/api/matakuliahs?populate=*');
    if (!matakuliahResponse.ok) {
      throw new Error(`Failed to fetch course details: ${matakuliahResponse.statusText}`);
    }
    const matakuliahData = await matakuliahResponse.json();
    console.log('Matakuliah API response:', JSON.stringify(matakuliahData, null, 2));

    const course = matakuliahData.data.find((c) => c.kode.trim() === courseCode);
    if (!course) {
      throw new Error('Course not found');
    }
    console.log('Found course:', course);

    const materisResponse = await fetch('http://localhost:1337/api/materis?populate=*');
    if (!materisResponse.ok) {
      throw new Error(`Failed to fetch materials: ${materisResponse.statusText}`);
    }
    const materisData = await materisResponse.json();
    console.log('Materis API response:', JSON.stringify(materisData, null, 2));

    const mahasiswaResponse = await fetch('http://localhost:1337/api/mahasiswas');
    if (!mahasiswaResponse.ok) {
      throw new Error(`Failed to fetch student data: ${mahasiswaResponse.statusText}`);
    }
    const mahasiswaData = await mahasiswaResponse.json();
    console.log('Mahasiswa API response:', JSON.stringify(mahasiswaData, null, 2));
    const student = mahasiswaData.data.find((m) => m.nim === nim);
    if (!student) {
      throw new Error('Student not found');
    }
    console.log('Found student:', student);

    const progressResponse = await fetch('http://localhost:1337/api/progress-belajars?populate=*');
    if (!progressResponse.ok) {
      throw new Error(`Failed to fetch progress data: ${progressResponse.statusText}`);
    }
    const progressData = await progressResponse.json();
    console.log('Progress API response:', JSON.stringify(progressData, null, 2));

    // Modified quizzes fetch
    const quizzesResponse = await fetch('http://localhost:1337/api/kuises?populate[0]=soal_kuis&populate[1]=pertemuan');
    if (!quizzesResponse.ok) {
      throw new Error(`Failed to fetch quizzes: ${quizzesResponse.statusText}`);
    }
    const quizzesData = await quizzesResponse.json();
    console.log('Quizzes API response:', JSON.stringify(quizzesData, null, 2));

    const sortedMeetings = course.pertemuans.sort((a, b) => a.pertemuanKe - b.pertemuanKe);

    const result = {
      id: course.id,
      title: course.nama.trim(),
      code: course.kode.trim(),
      semester: course.semester,
      sks: course.sks,
      programStudi: course.program_studi.nama,
      lecturers: course.dosens.map((dosen) => ({
        id: dosen.id,
        name: dosen.namaLengkap,
        nip: dosen.nip,
        nidn: dosen.nidn,
        imageUrl: dosen.imageUrl,
      })),
      studentId: student.id,
      meetings: sortedMeetings.map((meeting) => {
        const meetingMaterials = materisData.data
          .filter((materi) => materi.pertemuan && materi.pertemuan.id === meeting.id)
          .map((material) => {
            console.log('Processing material:', JSON.stringify(material, null, 2));
            let textContent = [];
            if (material.isiTeks && material.isiTeks.content) {
              material.isiTeks.content.forEach((node, nodeIndex) => {
                console.log(`Processing node ${nodeIndex}:`, JSON.stringify(node, null, 2));
                if (node.type === 'paragraph' && node.content) {
                  let paragraph = [];
                  node.content.forEach((item, itemIndex) => {
                    console.log(`Processing item ${itemIndex} in node ${nodeIndex}:`, JSON.stringify(item, null, 2));
                    if (item.type === 'text') {
                      let text = item.text;
                      if (item.marks) {
                        if (item.marks.some((m) => m.type === 'bold')) {
                          text = `**${text}**`;
                        }
                        if (item.marks.some((m) => m.type === 'link')) {
                          const link = item.marks.find((m) => m.type === 'link');
                          text = `[${text}](${link.attrs.href})`;
                        }
                      }
                      paragraph.push(text);
                    } else if (item.type === 'image' && item.attrs && item.attrs.src) {
                      paragraph.push(`[IMAGE:${item.attrs.src}|${item.attrs.alt || ''}|${item.attrs.title || ''}]`);
                    } else if (item.type === 'hardBreak') {
                      paragraph.push('\n');
                    }
                  });
                  textContent.push(paragraph.join(''));
                }
              });
            }
            const finalTextContent = textContent.join('\n').trim();
            console.log('Processed material textContent:', finalTextContent);

            return {
              id: material.id,
              documentId: material.documentId,
              title: material.judul,
              description: material.deskripsi
                ? material.deskripsi.map((d) => d.children.map((c) => c.text).join('')).join('')
                : '',
              videoUrl: material.videoYoutubeUrl || '',
              fileUrl: material.fileUrl
                ? material.fileUrl.map((file) => ({
                    id: file.id,
                    url: `http://localhost:1337${file.url}`,
                    name: file.name,
                    mime: file.mime,
                  }))
                : [],
              documentUrl: material.documentUrl
                ? material.documentUrl.map((doc) => ({
                    id: doc.id,
                    url: `http://localhost:1337${doc.url}`,
                    name: doc.name,
                    mime: doc.mime,
                  }))
                : [],
              textContent: finalTextContent,
            };
          });

        const meetingProgress = progressData.data.filter(
          (progress) =>
            progress.mahasiswa.id === student.id &&
            progress.pertemuan.id === meeting.id
        );

        const totalMaterials = meetingMaterials.length;
        const openedMaterials = meetingProgress.filter(
          (p) => p.status_class === 'sedang_dibaca' || p.status_class === 'selesai'
        ).length;
        const progressPercentage = totalMaterials > 0 ? (openedMaterials / totalMaterials) * 100 : 0;

        const meetingQuizzes = quizzesData.data
          .filter((quiz) => quiz.pertemuan && quiz.pertemuan.id === meeting.id)
          .map((quiz) => ({
            id: quiz.id,
            documentId: quiz.documentId,
            instructions: quiz.instruksi || [],
            type: quiz.jenis,
            startTime: quiz.waktuMulai,
            endTime: quiz.waktuSelesai,
            timer: quiz.timer,
            questions: quiz.soal_kuis
              ? quiz.soal_kuis.map((soal) => ({
                  id: soal.id,
                  documentId: soal.documentId,
                  question: soal.pertanyaan,
                  type: soal.jenis,
                  options: soal.pilihan
                    ? soal.pilihan.map((option) =>
                        option.children.map((child) => child.text).join('')
                      )
                    : null,
                  correctAnswer: soal.jawabanBenar,
                  weight: soal.bobot,
                }))
              : [],
          }));

        return {
          id: meeting.id,
          meetingNumber: meeting.pertemuanKe,
          topic: meeting.topik.trim(),
          date: meeting.tanggal,
          materials: meetingMaterials,
          quizzes: meetingQuizzes,
          progress: meetingProgress.length > 0
            ? meetingProgress.map((p) => ({
                id: p.id,
                documentId: p.documentId,
                status: p.status_class,
                waktuMulai: p.waktuMulai,
                waktuSelesai: p.waktuSelesai,
                materialId: p.materis ? p.materis.id : null,
              }))
            : meetingMaterials.map((m) => ({
                status: 'belum_dibaca',
                materialId: m.id,
                documentId: null,
              })),
          progressPercentage: progressPercentage.toFixed(0),
        };
      }),
    };

    console.log('Final course detail:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Error fetching course details:', error.message, error.stack);
    throw new Error(`Error fetching course details: ${error.message}`);
  }
};

export const saveProgress = async (mahasiswaId, pertemuanId, materialId, status, existingDocumentId) => {
  try {
    if (!mahasiswaId || !pertemuanId || !materialId || !['belum_dibaca', 'sedang_dibaca', 'selesai'].includes(status)) {
      throw new Error('Invalid input parameters for saving progress');
    }

    const now = new Date().toISOString();
    const payload = {
      data: {
        mahasiswa: mahasiswaId,
        pertemuan: pertemuanId,
        materis: materialId,
        status_class: status,
        waktuMulai: status === 'sedang_dibaca' ? now : null,
        waktuSelesai: status === 'selesai' ? now : null,
      },
    };

    console.log('Saving progress with payload:', JSON.stringify(payload, null, 2));
    let response;
    if (existingDocumentId) {
      console.log(`Updating progress with documentId: ${existingDocumentId}`);
      response = await fetch(`http://localhost:1337/api/progress-belajars/${existingDocumentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } else {
      console.log('Creating new progress entry');
      response = await fetch('http://localhost:1337/api/progress-belajars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to save progress:', JSON.stringify(errorData, null, 2));
      throw new Error(`Failed to save progress: ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json();
    console.log('Progress saved successfully:', result);
    return result;
  } catch (error) {
    console.error('Error saving progress:', error.message);
    throw new Error(`Error saving progress: ${error.message}`);
  }
};