<div class="modal fade" id="copyLink-<?=$meeting_id;?>" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel2"><?= $name;?> Meeting</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <form >
          <div class="modal-body">
            <div class="row">
              <div class="col mb-1">
                <?php $host = $_SERVER['HTTP_HOST'];?>
                    <input type="text" class="form-control" value="http://<?=$host;?>/attend-meet.php?meeting_id=<?=$meeting_id;?>" id="copyInput-<?=$meeting_id;?>">
                    <button id="copyBtn-<?=$meeting_id;?>"  class="btn btn-outline-secondary mt-2"><i class="bx bx-copy"></i>Copy </button>
              </div>
            </div>
            
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div class="modal fade" id="editMeeting-<?=$meeting_id;?>" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel2"><?= $name;?> Meeting</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <form action="manage/update-meeting.php"  method="post">
          <div class="modal-body">
            <div class="row">
              <div class="col mb-1">
                    <input type="hidden" name="meeting_id" value="<?= $meeting_id;?>">
                <label>Meeting</label>
               <input type="text" readonly name="name" class="form-control" value="<?= $name;?>"  placeholder="Instruction"/>
               <label for="description" class="mb-2 form-label">Description/Agenda</label>
               <textarea name="description" id="Aeditor-<?= $meeting_id;?>" class="form-control mb-2"></textarea>
                <label for="d" class="mt-2">Starts</label>
                 <span class="badge badge-secondary mb-2"><?= date("M d, Y h:i a",strtotime($stime)) ?></span> <br> <br>
                 <label for="d" class="mt-2">Ends</label>
                 <span class="badge badge-secondary mb-2"><?= date("M d, Y h:i a",strtotime($etime)) ?></span> <br>

              </div>
            </div>
            
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">
              Close
            </button>
            <button type="submit" class="btn btn-primary">Save changes</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <script>
                      document.addEventListener('DOMContentLoaded', function(){
                    const input = document.getElementById('copyInput-<?=$meeting_id;?>');
                    const text = input.value;
                    const copyBtn = document.getElementById("copyBtn-<?=$meeting_id;?>");
                    const toastLiveExample = document.getElementById("liveToast");
                    const toastMeassage = document.getElementById('toastMessage');
                    const toast = new bootstrap.Toast(toastLiveExample);

                    copyBtn.addEventListener('click', function(){
                      input.select();
                      input.setSelectionRange(0,99999);
                      try{
                        navigator.clipboard.writeText(input.value);
                        
                        //shpw the toast message
                        toastMessage.textContent = 'Text Copied to Clipboard!';
                        toastLiveExample.classList.remove('bg-danger');
                        toastLiveExample.classList.add('bg-success');
                        modal.hide();

                        toast.show();

                        input.blur();
                      }catch(err){
                        //shpw the toast message
                        toastMessage.textContent = 'Failed to Copy to Clipboard!';
                        toastLiveExample.classList.remove('bg-success');
                        toastLiveExample.classList.add('bg-danger');
                        modal.hide();

                        setTimeout(()=>toast.show(),100);

                        console.error("copy Failed: ", err);
                      }
                    });
                    
                  ClassicEditor
                      .create(document.querySelector('#Aeditor-<?= $meeting_id;?>'))
                      .catch(error => {
                          console.error(error);
                      });


                    
                  });
              </script>